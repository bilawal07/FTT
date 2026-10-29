using FTT.Domain.Enums;

namespace FTT.Application.DTOs;

public record CreateWorkspaceRequest(
    string Name,
    string? Description
);

public record JoinWorkspaceByCodeRequest(
    string InviteCode
);

public record CreateInviteCodeRequest(
    int ExpiryHours = 24,
    int? MaxUses = null
);

public record RespondJoinRequest(
    bool Approve
);

public record DirectInviteUserRequest(
    string UsernameOrEmail
);

public record WorkspaceMemberDto(
    Guid UserId,
    string FullName,
    string Username,
    string Email,
    string? PhoneNumber,
    string AvatarColor,
    UserRole Role,
    DateTime JoinedAt
);

public record WorkspaceInviteDto(
    Guid Id,
    string Code,
    DateTime CreatedAt,
    DateTime ExpiresAt,
    int? MaxUses,
    int UsesCount,
    bool IsExpired,
    bool IsActive
);

public record JoinRequestDto(
    Guid Id,
    Guid WorkspaceId,
    string WorkspaceName,
    Guid UserId,
    string UserFullName,
    string UserUsername,
    string UserEmail,
    string? UserPhone,
    string UserAvatarColor,
    JoinRequestStatus Status,
    DateTime RequestedAt,
    DateTime ExpiresAt,
    bool IsExpired
);

public record WorkspaceSearchDto(
    Guid Id,
    string Name,
    string? Description,
    int MemberCount,
    bool IsMember,
    bool HasPendingRequest
);

public record WorkspaceDetailDto(
    Guid Id,
    string Name,
    string? Description,
    DateTime CreatedAt,
    UserRole MyRole,
    int MemberCount,
    List<WorkspaceMemberDto> Members,
    List<WorkspaceInviteDto> ActiveInvites,
    List<JoinRequestDto> PendingRequests
);

