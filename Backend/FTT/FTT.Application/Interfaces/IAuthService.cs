using FTT.Application.Common;
using FTT.Application.DTOs;

namespace FTT.Application.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request);
    Task<ApiResponse<AuthResponse>> RefreshTokenAsync(RefreshTokenRequest request);
    Task<ApiResponse<CurrentUserResponse>> GetCurrentUserAsync(Guid userId);
}
