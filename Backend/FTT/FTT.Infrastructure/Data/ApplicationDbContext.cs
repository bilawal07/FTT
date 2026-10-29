using FTT.Application.Interfaces;
using FTT.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FTT.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<WorkspaceMember> WorkspaceMembers => Set<WorkspaceMember>();
    public DbSet<WorkspaceInvite> WorkspaceInvites => Set<WorkspaceInvite>();
    public DbSet<WorkspaceJoinRequest> WorkspaceJoinRequests => Set<WorkspaceJoinRequest>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User Configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Username).IsRequired().HasMaxLength(50);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
            entity.Property(u => u.PhoneNumber).HasMaxLength(30);
            entity.Property(u => u.Address).HasMaxLength(250);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.AvatarColor).HasMaxLength(20).HasDefaultValue("#2563EB");

            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        // Workspace Configuration
        modelBuilder.Entity<Workspace>(entity =>
        {
            entity.HasKey(w => w.Id);
            entity.Property(w => w.Name).IsRequired().HasMaxLength(100);
            entity.Property(w => w.Description).HasMaxLength(500);

            entity.HasOne(w => w.CreatedBy)
                .WithMany()
                .HasForeignKey(w => w.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // WorkspaceMember Configuration (Many-to-Many Junction)
        modelBuilder.Entity<WorkspaceMember>(entity =>
        {
            entity.HasKey(wm => wm.Id);
            entity.Property(wm => wm.Role).HasConversion<string>().HasMaxLength(20);

            // Composite unique index: A user can only be a member of a workspace once
            entity.HasIndex(wm => new { wm.WorkspaceId, wm.UserId }).IsUnique();

            entity.HasOne(wm => wm.Workspace)
                .WithMany(w => w.Members)
                .HasForeignKey(wm => wm.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(wm => wm.User)
                .WithMany(u => u.WorkspaceMembers)
                .HasForeignKey(wm => wm.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // WorkspaceInvite Configuration
        modelBuilder.Entity<WorkspaceInvite>(entity =>
        {
            entity.HasKey(wi => wi.Id);
            entity.Property(wi => wi.Code).IsRequired().HasMaxLength(12);
            entity.HasIndex(wi => wi.Code).IsUnique();

            entity.HasOne(wi => wi.Workspace)
                .WithMany(w => w.Invites)
                .HasForeignKey(wi => wi.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(wi => wi.CreatedBy)
                .WithMany()
                .HasForeignKey(wi => wi.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // WorkspaceJoinRequest Configuration
        modelBuilder.Entity<WorkspaceJoinRequest>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Status).HasConversion<string>().HasMaxLength(20);

            entity.HasOne(r => r.Workspace)
                .WithMany(w => w.JoinRequests)
                .HasForeignKey(r => r.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.User)
                .WithMany(u => u.JoinRequests)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(r => r.RespondedBy)
                .WithMany()
                .HasForeignKey(r => r.RespondedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // RefreshToken Configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Token).IsRequired().HasMaxLength(255);
            entity.HasIndex(r => r.Token).IsUnique();

            entity.HasOne(r => r.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Note: No seed data per user requirement. Database starts clean.
    }
}
