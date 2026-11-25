using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Domain.Repositories;
using MediFlow.Drugs;
using MediFlow.Inventories;
using MediFlow.Orders;
using MediFlow.Sales;
using MediFlow.Dashboard;
using MediFlow.Application.Dashboard;
using MediFlow.Permissions;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("api/app/[controller]")]
[Authorize]
public class DashboardController : AbpController
{
    private readonly IDashboardAppService _dashboardAppService;

    public DashboardController(IDashboardAppService dashboardAppService)
    {
        _dashboardAppService = dashboardAppService;
    }

    [HttpPost("get-stats")]
    [Authorize]
    public async Task<ActionResult<DashboardStatsDto>> GetStatsAsync(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? period,
        [FromQuery] Guid? pharmacyId,
        [FromQuery] Guid? warehouseId)
    {
        var filter = new DashboardFilterDto
        {
            StartDate = startDate,
            EndDate = endDate,
            Period = period,
            PharmacyId = pharmacyId,
            WarehouseId = warehouseId
        };

        return Ok(await _dashboardAppService.GetStatsAsync(filter));
    }

    [HttpGet("trend")]
    [Authorize(MediFlowPermissions.DashboardTrend)]
    public async Task<ActionResult<DashboardTrendDto>> GetTrendAsync(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? period)
    {
        var filter = new DashboardFilterDto
        {
            StartDate = startDate,
            EndDate = endDate,
            Period = period
        };

        return Ok(await _dashboardAppService.GetTrendAsync(filter));
    }
}
