using FTT.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FTT.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Workspace> Workspaces { get; }
    DbSet<WorkspaceMember> WorkspaceMembers { get; }
    DbSet<WorkspaceInvite> WorkspaceInvites { get; }
    DbSet<WorkspaceJoinRequest> WorkspaceJoinRequests { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
