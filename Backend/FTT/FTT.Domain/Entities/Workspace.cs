namespace FTT.Domain.Entities;

public class Workspace
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? CreatedBy { get; set; }
    public ICollection<WorkspaceMember> Members { get; set; } = new List<WorkspaceMember>();
    public ICollection<WorkspaceInvite> Invites { get; set; } = new List<WorkspaceInvite>();
    public ICollection<WorkspaceJoinRequest> JoinRequests { get; set; } = new List<WorkspaceJoinRequest>();
}
