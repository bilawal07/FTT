using System.Security.Claims;
using FTT.Application.Interfaces;

namespace FTT.Api.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var idClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(idClaim, out var id) ? id : null;
        }
    }

    public Guid? WorkspaceId
    {
        get
        {
            var wsClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("workspaceId")?.Value;
            return Guid.TryParse(wsClaim, out var wsId) ? wsId : null;
        }
    }

    public string? Role => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;
}

