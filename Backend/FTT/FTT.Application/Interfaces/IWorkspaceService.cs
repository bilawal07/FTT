using FTT.Application.Common;
using FTT.Application.DTOs;

namespace FTT.Application.Interfaces;

public interface IWorkspaceService
{
    Task<ApiResponse<WorkspaceDetailDto>> CreateWorkspaceAsync(Guid userId, CreateWorkspaceRequest request);
    Task<ApiResponse<List<WorkspaceSummaryDto>>> GetUserWorkspacesAsync(Guid userId);
    Task<ApiResponse<WorkspaceDetailDto>> GetWorkspaceDetailAsync(Guid userId, Guid workspaceId);
    Task<ApiResponse<WorkspaceSummaryDto>> JoinWorkspaceByCodeAsync(Guid userId, JoinWorkspaceByCodeRequest request);
    Task<ApiResponse<WorkspaceInviteDto>> CreateInviteCodeAsync(Guid userId, Guid workspaceId, CreateInviteCodeRequest request);
    Task<ApiResponse<bool>> RevokeInviteCodeAsync(Guid userId, Guid workspaceId, Guid inviteId);
    Task<ApiResponse<List<WorkspaceSearchDto>>> SearchWorkspacesAsync(Guid userId, string query);
    Task<ApiResponse<JoinRequestDto>> RequestToJoinWorkspaceAsync(Guid userId, Guid workspaceId);
    Task<ApiResponse<List<JoinRequestDto>>> GetPendingJoinRequestsAsync(Guid userId, Guid workspaceId);
    Task<ApiResponse<bool>> RespondToJoinRequestAsync(Guid userId, Guid workspaceId, Guid requestId, bool approve);
    Task<ApiResponse<List<UserDto>>> SearchUsersAsync(Guid userId, string query);
    Task<ApiResponse<bool>> DirectInviteUserAsync(Guid userId, Guid workspaceId, DirectInviteUserRequest request);
}

