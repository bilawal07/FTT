namespace FTT.Application.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    Guid? WorkspaceId { get; }
    string? Role { get; }
}

