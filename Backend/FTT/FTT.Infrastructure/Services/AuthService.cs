using FTT.Application.Common;
using FTT.Application.DTOs;
using FTT.Application.Interfaces;
using FTT.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FTT.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;

    public AuthService(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtService jwtService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var username = request.Username.Trim().ToLowerInvariant();

        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == email))
        {
            return ApiResponse<AuthResponse>.Fail("A user with this email already exists.");
        }

        if (await _context.Users.AnyAsync(u => u.Username.ToLower() == username))
        {
            return ApiResponse<AuthResponse>.Fail("This username is already taken.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Username = request.Username.Trim(),
            Email = email,
            PhoneNumber = request.PhoneNumber?.Trim(),
            Address = request.Address?.Trim(),
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            AvatarColor = string.IsNullOrWhiteSpace(request.AvatarColor) ? "#2563EB" : request.AvatarColor,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        var (accessToken, expiresAt) = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken(user.Id);
        _context.RefreshTokens.Add(refreshToken);

        await _context.SaveChangesAsync();

        var authResponse = new AuthResponse(
            accessToken,
            refreshToken.Token,
            expiresAt,
            MapUserDto(user),
            new List<WorkspaceSummaryDto>()
        );

        return ApiResponse<AuthResponse>.Ok(authResponse, "Account registered successfully.");
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var identifier = request.UsernameOrEmail.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == identifier || u.Username.ToLower() == identifier);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return ApiResponse<AuthResponse>.Fail("Invalid username/email or password.");
        }

        var (accessToken, expiresAt) = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken(user.Id);

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        var workspaces = await GetUserWorkspaceSummariesAsync(user.Id);

        var authResponse = new AuthResponse(
            accessToken,
            refreshToken.Token,
            expiresAt,
            MapUserDto(user),
            workspaces
        );

        return ApiResponse<AuthResponse>.Ok(authResponse, "Login successful.");
    }

    public async Task<ApiResponse<AuthResponse>> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var existingToken = await _context.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == request.RefreshToken);

        if (existingToken == null || !existingToken.IsActive || existingToken.User == null)
        {
            return ApiResponse<AuthResponse>.Fail("Invalid or expired refresh token.");
        }

        // Revoke the old refresh token (Token rotation)
        existingToken.RevokedAt = DateTime.UtcNow;

        var user = existingToken.User;
        var (newAccessToken, expiresAt) = _jwtService.GenerateAccessToken(user);
        var newRefreshToken = _jwtService.GenerateRefreshToken(user.Id);

        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync();

        var workspaces = await GetUserWorkspaceSummariesAsync(user.Id);

        var authResponse = new AuthResponse(
            newAccessToken,
            newRefreshToken.Token,
            expiresAt,
            MapUserDto(user),
            workspaces
        );

        return ApiResponse<AuthResponse>.Ok(authResponse, "Token refreshed successfully.");
    }

    public async Task<ApiResponse<CurrentUserResponse>> GetCurrentUserAsync(Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return ApiResponse<CurrentUserResponse>.Fail("User not found.");
        }

        var workspaces = await GetUserWorkspaceSummariesAsync(user.Id);

        var response = new CurrentUserResponse(
            MapUserDto(user),
            workspaces
        );

        return ApiResponse<CurrentUserResponse>.Ok(response);
    }

    private async Task<List<WorkspaceSummaryDto>> GetUserWorkspaceSummariesAsync(Guid userId)
    {
        return await _context.WorkspaceMembers
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
    }

    private static UserDto MapUserDto(User u) => new(
        u.Id,
        u.FullName,
        u.Username,
        u.Email,
        u.PhoneNumber,
        u.Address,
        u.AvatarColor,
        u.CreatedAt
    );
}
