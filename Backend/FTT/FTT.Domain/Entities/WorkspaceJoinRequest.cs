using FTT.Domain.Enums;

namespace FTT.Domain.Entities;

public class WorkspaceJoinRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WorkspaceId { get; set; }
    public Guid UserId { get; set; }
    public JoinRequestStatus Status { get; set; } = JoinRequestStatus.Pending;
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(48); // default 48h expiration
    public DateTime? RespondedAt { get; set; }
    public Guid? RespondedByUserId { get; set; }

    public bool IsExpired => Status == JoinRequestStatus.Pending && DateTime.UtcNow >= ExpiresAt;

    public Workspace? Workspace { get; set; }
    public User? User { get; set; }
    public User? RespondedBy { get; set; }
}

