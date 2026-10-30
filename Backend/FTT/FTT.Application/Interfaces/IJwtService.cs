using FTT.Domain.Entities;

namespace FTT.Application.Interfaces;

public interface IJwtService
{
    (string Token, DateTime ExpiresAt) GenerateAccessToken(User user);
    RefreshToken GenerateRefreshToken(Guid userId);
}
