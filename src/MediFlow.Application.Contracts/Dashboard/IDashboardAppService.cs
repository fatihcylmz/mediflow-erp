using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace MediFlow.Dashboard;

public interface IDashboardAppService : IApplicationService
{
    Task<DashboardStatsDto> GetStatsAsync(DashboardFilterDto filter);

    Task<DashboardTrendDto> GetTrendAsync(DashboardFilterDto filter);
}
