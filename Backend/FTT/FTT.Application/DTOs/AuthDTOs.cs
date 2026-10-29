using FTT.Domain.Enums;

namespace FTT.Application.DTOs;

public record RegisterRequest(
    string FullName,
    string Username,
    string Email,
    string Password,
    string? PhoneNumber,
    string? Address,
    string? AvatarColor
);

public record LoginRequest(
    string UsernameOrEmail,
    string Password
);

public record RefreshTokenRequest(
    string RefreshToken
);

public record UserDto(
    Guid Id,
    string FullName,
    string Username,
    string Email,
    string? PhoneNumber,
    string? Address,
    string AvatarColor,
    DateTime CreatedAt
);

public record WorkspaceSummaryDto(
    Guid Id,
    string Name,
    string? Description,
    UserRole Role,
    int MemberCount,
    DateTime JoinedAt
);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User,
    List<WorkspaceSummaryDto> Workspaces
);

public record CurrentUserResponse(
    UserDto User,
    List<WorkspaceSummaryDto> Workspaces
);
