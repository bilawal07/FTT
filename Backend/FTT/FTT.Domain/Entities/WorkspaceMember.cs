using FTT.Domain.Enums;

namespace FTT.Domain.Entities;

public class WorkspaceMember
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WorkspaceId { get; set; }
    public Guid UserId { get; set; }
    public UserRole Role { get; set; } = UserRole.Member;
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public Workspace? Workspace { get; set; }
    public User? User { get; set; }
}

