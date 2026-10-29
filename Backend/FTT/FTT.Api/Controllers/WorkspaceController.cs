using FTT.Application.Common;
using FTT.Application.DTOs;
using FTT.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FTT.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkspaceController : ControllerBase
{
    private readonly IWorkspaceService _workspaceService;
    private readonly ICurrentUserService _currentUserService;

    public WorkspaceController(IWorkspaceService workspaceService, ICurrentUserService currentUserService)
    {
        _workspaceService = workspaceService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<WorkspaceSummaryDto>>>> GetMyWorkspaces()
    {
        var userId = GetCurrentUserId();
        var result = await _workspaceService.GetUserWorkspacesAsync(userId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<WorkspaceDetailDto>>> CreateWorkspace([FromBody] CreateWorkspaceRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _workspaceService.CreateWorkspaceAsync(userId, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<WorkspaceDetailDto>>> GetWorkspaceDetail(Guid id)
    {
        var userId = GetCurrentUserId();
        var result = await _workspaceService.GetWorkspaceDetailAsync(userId, id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("join-by-code")]
    public async Task<ActionResult<ApiResponse<WorkspaceSummaryDto>>> JoinByCode([FromBody] JoinWorkspaceByCodeRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _workspaceService.JoinWorkspaceByCodeAsync(userId, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{id:guid}/invites")]
    public async Task<ActionResult<ApiResponse<WorkspaceInviteDto>>> CreateInviteCode(Guid id, [FromBody] CreateInviteCodeRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _workspaceService.CreateInviteCodeAsync(userId, id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}/invites/{inviteId:guid}")]
    public async Task<ActionResult<ApiResponse<bool>>> RevokeInviteCode(Guid id, Guid inviteId)
    {
        var userId = GetCurrentUserId();
        var result = await _workspaceService.RevokeInviteCodeAsync(userId, id, inviteId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<List<WorkspaceSearchDto>>>> SearchWorkspaces([FromQuery] string? q)
    {
        var userId = GetCurrentUserId();
        var result = await _workspaceService.SearchWorkspacesAsync(userId, q ?? "");
        return Ok(result);
    }

    [HttpPost("{id:guid}/join-request")]
    public async Task<ActionResult<ApiResponse<JoinRequestDto>>> RequestToJoin(Guid id)
    {
        var userId = GetCurrentUserId();
        var result = await _workspaceService.RequestToJoinWorkspaceAsync(userId, id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("{id:guid}/join-requests")]
    public async Task<ActionResult<ApiResponse<List<JoinRequestDto>>>> GetPendingJoinRequests(Guid id)
    {
        var userId = GetCurrentUserId();
        var result = await _workspaceService.GetPendingJoinRequestsAsync(userId, id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{id:guid}/join-requests/{requestId:guid}/respond")]
    public async Task<ActionResult<ApiResponse<bool>>> RespondToJoinRequest(Guid id, Guid requestId, [FromBody] RespondJoinRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _workspaceService.RespondToJoinRequestAsync(userId, id, requestId, request.Approve);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("users/search")]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> SearchUsers([FromQuery] string? q)
    {
        var userId = GetCurrentUserId();
        var result = await _workspaceService.SearchUsersAsync(userId, q ?? "");
        return Ok(result);
    }

    [HttpPost("{id:guid}/invite-user")]
    public async Task<ActionResult<ApiResponse<bool>>> DirectInviteUser(Guid id, [FromBody] DirectInviteUserRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _workspaceService.DirectInviteUserAsync(userId, id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    private Guid GetCurrentUserId()
    {
        return _currentUserService.UserId 
            ?? throw new UnauthorizedAccessException("User identifier not found in claims.");
    }
}

