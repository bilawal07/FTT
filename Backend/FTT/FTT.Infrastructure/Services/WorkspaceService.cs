using FTT.Application.Common;
using FTT.Application.DTOs;
using FTT.Application.Interfaces;
using FTT.Domain.Entities;
using FTT.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FTT.Infrastructure.Services;

public class WorkspaceService : IWorkspaceService
{
    private readonly IApplicationDbContext _context;

    public WorkspaceService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<WorkspaceDetailDto>> CreateWorkspaceAsync(Guid userId, CreateWorkspaceRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return ApiResponse<WorkspaceDetailDto>.Fail("User not found.");
        }

        var workspace = new Workspace
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        var member = new WorkspaceMember
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspace.Id,
            UserId = userId,
            Role = UserRole.Admin,
            JoinedAt = DateTime.UtcNow
        };

        // Automatically create an initial 7-day invite code for convenience
        var initialInvite = new WorkspaceInvite
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspace.Id,
            Code = await GenerateUniqueInviteCodeAsync(),
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            MaxUses = null,
            UsesCount = 0,
            IsRevoked = false
        };

        _context.Workspaces.Add(workspace);
        _context.WorkspaceMembers.Add(member);
        _context.WorkspaceInvites.Add(initialInvite);

        await _context.SaveChangesAsync();

        var detail = new WorkspaceDetailDto(
            workspace.Id,
            workspace.Name,
            workspace.Description,
            workspace.CreatedAt,
            UserRole.Admin,
            1,
            new List<WorkspaceMemberDto>
            {
                new(user.Id, user.FullName, user.Username, user.Email, user.PhoneNumber, user.AvatarColor, UserRole.Admin, member.JoinedAt)
            },
            new List<WorkspaceInviteDto>
            {
                MapInviteDto(initialInvite)
            },
            new List<JoinRequestDto>()
        );

        return ApiResponse<WorkspaceDetailDto>.Ok(detail, "Workspace created successfully.");
    }

    public async Task<ApiResponse<List<WorkspaceSummaryDto>>> GetUserWorkspacesAsync(Guid userId)
    {
        var workspaces = await _context.WorkspaceMembers
            .Where(wm => wm.UserId == userId)
            .Include(wm => wm.Workspace)
            .ThenInclude(w => w!.Members)
            .OrderByDescending(wm => wm.JoinedAt)
            .Select(wm => new WorkspaceSummaryDto(
                wm.WorkspaceId,
                wm.Workspace!.Name,
                wm.Workspace.Description,
                wm.Role,
                wm.Workspace.Members.Count,
                wm.JoinedAt
            ))
            .ToListAsync();

        return ApiResponse<List<WorkspaceSummaryDto>>.Ok(workspaces);
    }

    public async Task<ApiResponse<WorkspaceDetailDto>> GetWorkspaceDetailAsync(Guid userId, Guid workspaceId)
    {
        var membership = await _context.WorkspaceMembers
            .FirstOrDefaultAsync(wm => wm.WorkspaceId == workspaceId && wm.UserId == userId);

        if (membership == null)
        {
            return ApiResponse<WorkspaceDetailDto>.Fail("You are not a member of this workspace.");
        }

        var workspace = await _context.Workspaces
            .Include(w => w.Members)
            .ThenInclude(m => m.User)
            .Include(w => w.Invites)
            .Include(w => w.JoinRequests)
            .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(w => w.Id == workspaceId);

        if (workspace == null)
        {
            return ApiResponse<WorkspaceDetailDto>.Fail("Workspace not found.");
        }

        var members = workspace.Members
            .OrderBy(m => m.User!.FullName)
            .Select(m => new WorkspaceMemberDto(
                m.UserId,
                m.User!.FullName,
                m.User.Username,
                m.User.Email,
                m.User.PhoneNumber,
                m.User.AvatarColor,
                m.Role,
                m.JoinedAt
            ))
            .ToList();

        var activeInvites = new List<WorkspaceInviteDto>();
        var pendingRequests = new List<JoinRequestDto>();

        if (membership.Role == UserRole.Admin)
        {
            activeInvites = workspace.Invites
                .Where(i => !i.IsRevoked && i.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(i => i.CreatedAt)
                .Select(MapInviteDto)
                .ToList();

            pendingRequests = workspace.JoinRequests
                .Where(r => r.Status == JoinRequestStatus.Pending && r.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(r => r.RequestedAt)
                .Select(r => MapJoinRequestDto(r, workspace.Name))
                .ToList();
        }

        var detail = new WorkspaceDetailDto(
            workspace.Id,
            workspace.Name,
            workspace.Description,
            workspace.CreatedAt,
            membership.Role,
            workspace.Members.Count,
            members,
            activeInvites,
            pendingRequests
        );

        return ApiResponse<WorkspaceDetailDto>.Ok(detail);
    }

    public async Task<ApiResponse<WorkspaceSummaryDto>> JoinWorkspaceByCodeAsync(Guid userId, JoinWorkspaceByCodeRequest request)
    {
        var code = request.InviteCode.Trim().ToUpperInvariant();

        var invite = await _context.WorkspaceInvites
            .Include(wi => wi.Workspace)
            .ThenInclude(w => w!.Members)
            .FirstOrDefaultAsync(wi => wi.Code == code);

        if (invite == null)
        {
            return ApiResponse<WorkspaceSummaryDto>.Fail("Invalid invite code. No matching invite found.");
        }

        if (invite.IsRevoked)
        {
            return ApiResponse<WorkspaceSummaryDto>.Fail("This invite code has been revoked by the workspace administrator.");
        }

        if (DateTime.UtcNow >= invite.ExpiresAt)
        {
            return ApiResponse<WorkspaceSummaryDto>.Fail("This invite code has expired.");
        }

        if (invite.MaxUses.HasValue && invite.UsesCount >= invite.MaxUses.Value)
        {
            return ApiResponse<WorkspaceSummaryDto>.Fail("This invite code has reached its maximum usage limit.");
        }

        var alreadyMember = await _context.WorkspaceMembers
            .AnyAsync(wm => wm.WorkspaceId == invite.WorkspaceId && wm.UserId == userId);

        if (alreadyMember)
        {
            return ApiResponse<WorkspaceSummaryDto>.Fail("You are already a member of this workspace.");
        }

        var member = new WorkspaceMember
        {
            Id = Guid.NewGuid(),
            WorkspaceId = invite.WorkspaceId,
            UserId = userId,
            Role = UserRole.Member,
            JoinedAt = DateTime.UtcNow
        };

        invite.UsesCount++;
        _context.WorkspaceMembers.Add(member);

        // If user had a pending join request for this workspace, mark it approved
        var existingRequest = await _context.WorkspaceJoinRequests
            .FirstOrDefaultAsync(r => r.WorkspaceId == invite.WorkspaceId && r.UserId == userId && r.Status == JoinRequestStatus.Pending);

        if (existingRequest != null)
        {
            existingRequest.Status = JoinRequestStatus.Approved;
            existingRequest.RespondedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        var summary = new WorkspaceSummaryDto(
            invite.Workspace!.Id,
            invite.Workspace.Name,
            invite.Workspace.Description,
            UserRole.Member,
            invite.Workspace.Members.Count + 1,
            member.JoinedAt
        );

        return ApiResponse<WorkspaceSummaryDto>.Ok(summary, $"Successfully joined {invite.Workspace.Name}!");
    }

    public async Task<ApiResponse<WorkspaceInviteDto>> CreateInviteCodeAsync(Guid userId, Guid workspaceId, CreateInviteCodeRequest request)
    {
        var isAdmin = await _context.WorkspaceMembers
            .AnyAsync(wm => wm.WorkspaceId == workspaceId && wm.UserId == userId && wm.Role == UserRole.Admin);

        if (!isAdmin)
        {
            return ApiResponse<WorkspaceInviteDto>.Fail("Only workspace administrators can generate invite codes.");
        }

        var hours = request.ExpiryHours <= 0 ? 24 : request.ExpiryHours;
        var code = await GenerateUniqueInviteCodeAsync();

        var invite = new WorkspaceInvite
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            Code = code,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(hours),
            MaxUses = request.MaxUses,
            UsesCount = 0,
            IsRevoked = false
        };

        _context.WorkspaceInvites.Add(invite);
        await _context.SaveChangesAsync();

        return ApiResponse<WorkspaceInviteDto>.Ok(MapInviteDto(invite), "Invite code generated successfully.");
    }

    public async Task<ApiResponse<bool>> RevokeInviteCodeAsync(Guid userId, Guid workspaceId, Guid inviteId)
    {
        var isAdmin = await _context.WorkspaceMembers
            .AnyAsync(wm => wm.WorkspaceId == workspaceId && wm.UserId == userId && wm.Role == UserRole.Admin);

        if (!isAdmin)
        {
            return ApiResponse<bool>.Fail("Only workspace administrators can revoke invite codes.");
        }

        var invite = await _context.WorkspaceInvites
            .FirstOrDefaultAsync(i => i.Id == inviteId && i.WorkspaceId == workspaceId);

        if (invite == null)
        {
            return ApiResponse<bool>.Fail("Invite code not found.");
        }

        invite.IsRevoked = true;
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, "Invite code revoked.");
    }

    public async Task<ApiResponse<List<WorkspaceSearchDto>>> SearchWorkspacesAsync(Guid userId, string query)
    {
        var q = query.Trim().ToLowerInvariant();

        var userMemberships = await _context.WorkspaceMembers
            .Where(wm => wm.UserId == userId)
            .Select(wm => wm.WorkspaceId)
            .ToListAsync();

        var userPendingRequests = await _context.WorkspaceJoinRequests
            .Where(r => r.UserId == userId && r.Status == JoinRequestStatus.Pending && r.ExpiresAt > DateTime.UtcNow)
            .Select(r => r.WorkspaceId)
            .ToListAsync();

        var workspaces = await _context.Workspaces
            .Include(w => w.Members)
            .Where(w => string.IsNullOrWhiteSpace(q) || w.Name.ToLower().Contains(q) || (w.Description != null && w.Description.ToLower().Contains(q)))
            .OrderBy(w => w.Name)
            .Take(20)
            .Select(w => new WorkspaceSearchDto(
                w.Id,
                w.Name,
                w.Description,
                w.Members.Count,
                userMemberships.Contains(w.Id),
                userPendingRequests.Contains(w.Id)
            ))
            .ToListAsync();

        return ApiResponse<List<WorkspaceSearchDto>>.Ok(workspaces);
    }

    public async Task<ApiResponse<JoinRequestDto>> RequestToJoinWorkspaceAsync(Guid userId, Guid workspaceId)
    {
        var workspace = await _context.Workspaces.FirstOrDefaultAsync(w => w.Id == workspaceId);
        if (workspace == null)
        {
            return ApiResponse<JoinRequestDto>.Fail("Workspace not found.");
        }

        var isMember = await _context.WorkspaceMembers
            .AnyAsync(wm => wm.WorkspaceId == workspaceId && wm.UserId == userId);

        if (isMember)
        {
            return ApiResponse<JoinRequestDto>.Fail("You are already a member of this workspace.");
        }

        var existingRequest = await _context.WorkspaceJoinRequests
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.WorkspaceId == workspaceId && r.UserId == userId && r.Status == JoinRequestStatus.Pending && r.ExpiresAt > DateTime.UtcNow);

        if (existingRequest != null)
        {
            return ApiResponse<JoinRequestDto>.Fail("You already have an active pending join request for this workspace.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return ApiResponse<JoinRequestDto>.Fail("User not found.");
        }

        var request = new WorkspaceJoinRequest
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            UserId = userId,
            Status = JoinRequestStatus.Pending,
            RequestedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(48)
        };

        _context.WorkspaceJoinRequests.Add(request);
        await _context.SaveChangesAsync();

        return ApiResponse<JoinRequestDto>.Ok(MapJoinRequestDto(request, workspace.Name, user), "Join request submitted to workspace administrator.");
    }

    public async Task<ApiResponse<List<JoinRequestDto>>> GetPendingJoinRequestsAsync(Guid userId, Guid workspaceId)
    {
        var isAdmin = await _context.WorkspaceMembers
            .AnyAsync(wm => wm.WorkspaceId == workspaceId && wm.UserId == userId && wm.Role == UserRole.Admin);

        if (!isAdmin)
        {
            return ApiResponse<List<JoinRequestDto>>.Fail("Only administrators can view join requests.");
        }

        var workspace = await _context.Workspaces.FirstOrDefaultAsync(w => w.Id == workspaceId);
        var workspaceName = workspace?.Name ?? "";

        var requests = await _context.WorkspaceJoinRequests
            .Where(r => r.WorkspaceId == workspaceId && r.Status == JoinRequestStatus.Pending && r.ExpiresAt > DateTime.UtcNow)
            .Include(r => r.User)
            .OrderByDescending(r => r.RequestedAt)
            .Select(r => MapJoinRequestDto(r, workspaceName))
            .ToListAsync();

        return ApiResponse<List<JoinRequestDto>>.Ok(requests);
    }

    public async Task<ApiResponse<bool>> RespondToJoinRequestAsync(Guid userId, Guid workspaceId, Guid requestId, bool approve)
    {
        var isAdmin = await _context.WorkspaceMembers
            .AnyAsync(wm => wm.WorkspaceId == workspaceId && wm.UserId == userId && wm.Role == UserRole.Admin);

        if (!isAdmin)
        {
            return ApiResponse<bool>.Fail("Only administrators can approve or reject join requests.");
        }

        var joinRequest = await _context.WorkspaceJoinRequests
            .FirstOrDefaultAsync(r => r.Id == requestId && r.WorkspaceId == workspaceId);

        if (joinRequest == null)
        {
            return ApiResponse<bool>.Fail("Join request not found.");
        }

        if (joinRequest.Status != JoinRequestStatus.Pending)
        {
            return ApiResponse<bool>.Fail($"This join request has already been {joinRequest.Status.ToString().ToLower()}.");
        }

        joinRequest.RespondedAt = DateTime.UtcNow;
        joinRequest.RespondedByUserId = userId;

        if (approve)
        {
            joinRequest.Status = JoinRequestStatus.Approved;

            var alreadyMember = await _context.WorkspaceMembers
                .AnyAsync(wm => wm.WorkspaceId == workspaceId && wm.UserId == joinRequest.UserId);

            if (!alreadyMember)
            {
                _context.WorkspaceMembers.Add(new WorkspaceMember
                {
                    Id = Guid.NewGuid(),
                    WorkspaceId = workspaceId,
                    UserId = joinRequest.UserId,
                    Role = UserRole.Member,
                    JoinedAt = DateTime.UtcNow
                });
            }
        }
        else
        {
            joinRequest.Status = JoinRequestStatus.Rejected;
        }

        await _context.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true, approve ? "Member request approved." : "Member request rejected.");
    }

    public async Task<ApiResponse<List<UserDto>>> SearchUsersAsync(Guid userId, string query)
    {
        var q = query.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(q))
        {
            return ApiResponse<List<UserDto>>.Ok(new List<UserDto>());
        }

        var users = await _context.Users
            .Where(u => u.Id != userId && (u.Username.ToLower().Contains(q) || u.Email.ToLower().Contains(q) || u.FullName.ToLower().Contains(q)))
            .OrderBy(u => u.FullName)
            .Take(15)
            .Select(u => new UserDto(u.Id, u.FullName, u.Username, u.Email, u.PhoneNumber, u.Address, u.AvatarColor, u.CreatedAt))
            .ToListAsync();

        return ApiResponse<List<UserDto>>.Ok(users);
    }

    public async Task<ApiResponse<bool>> DirectInviteUserAsync(Guid userId, Guid workspaceId, DirectInviteUserRequest request)
    {
        var isAdmin = await _context.WorkspaceMembers
            .AnyAsync(wm => wm.WorkspaceId == workspaceId && wm.UserId == userId && wm.Role == UserRole.Admin);

        if (!isAdmin)
        {
            return ApiResponse<bool>.Fail("Only administrators can invite users directly.");
        }

        var identifier = request.UsernameOrEmail.Trim().ToLowerInvariant();
        var targetUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == identifier || u.Username.ToLower() == identifier);

        if (targetUser == null)
        {
            return ApiResponse<bool>.Fail("User not found with this username or email.");
        }

        var isAlreadyMember = await _context.WorkspaceMembers
            .AnyAsync(wm => wm.WorkspaceId == workspaceId && wm.UserId == targetUser.Id);

        if (isAlreadyMember)
        {
            return ApiResponse<bool>.Fail("This user is already a member of this workspace.");
        }

        var member = new WorkspaceMember
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspaceId,
            UserId = targetUser.Id,
            Role = UserRole.Member,
            JoinedAt = DateTime.UtcNow
        };

        _context.WorkspaceMembers.Add(member);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.Ok(true, $"{targetUser.FullName} was added to the workspace.");
    }

    private async Task<string> GenerateUniqueInviteCodeAsync()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();

        for (var attempt = 0; attempt < 20; attempt++)
        {
            var code = new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());

            if (!await _context.WorkspaceInvites.AnyAsync(w => w.Code == code))
            {
                return code;
            }
        }

        return Guid.NewGuid().ToString("N")[..6].ToUpperInvariant();
    }

    private static WorkspaceInviteDto MapInviteDto(WorkspaceInvite i) => new(
        i.Id,
        i.Code,
        i.CreatedAt,
        i.ExpiresAt,
        i.MaxUses,
        i.UsesCount,
        i.IsExpired,
        i.IsActive
    );

    private static JoinRequestDto MapJoinRequestDto(WorkspaceJoinRequest r, string workspaceName, User? user = null)
    {
        var u = user ?? r.User;
        return new JoinRequestDto(
            r.Id,
            r.WorkspaceId,
            workspaceName,
            r.UserId,
            u?.FullName ?? "",
            u?.Username ?? "",
            u?.Email ?? "",
            u?.PhoneNumber,
            u?.AvatarColor ?? "#2563EB",
            r.Status,
            r.RequestedAt,
            r.ExpiresAt,
            r.IsExpired
        );
    }
}
