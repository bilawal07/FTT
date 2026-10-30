namespace FTT.Domain.Entities;

public class WorkspaceInvite
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WorkspaceId { get; set; }
    public string Code { get; set; } = string.Empty;
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public int? MaxUses { get; set; }
    public int UsesCount { get; set; } = 0;
    public bool IsRevoked { get; set; } = false;

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired && (MaxUses == null || UsesCount < MaxUses);

    public Workspace? Workspace { get; set; }
    public User? CreatedBy { get; set; }
}

