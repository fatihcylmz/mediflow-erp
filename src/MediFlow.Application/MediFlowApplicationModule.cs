using Volo.Abp;
using Volo.Abp.Account;
using Volo.Abp.Application;
using Volo.Abp.Mapperly;
using Volo.Abp.Identity;
using Volo.Abp.FeatureManagement;
using Volo.Abp.Modularity;
using Volo.Abp.PermissionManagement;
using Volo.Abp.SettingManagement;
using Volo.Abp.TenantManagement;
using Microsoft.Extensions.DependencyInjection;
using MediFlow.Application.Services;

namespace MediFlow;

[DependsOn(
    typeof(MediFlowDomainModule),
    typeof(AbpAccountApplicationModule),
    typeof(MediFlowApplicationContractsModule),
    typeof(AbpIdentityApplicationModule),
    typeof(AbpPermissionManagementApplicationModule),
    typeof(AbpTenantManagementApplicationModule),
    typeof(AbpFeatureManagementApplicationModule),
    typeof(AbpSettingManagementApplicationModule)
    )]
public class MediFlowApplicationModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddMapperlyObjectMapper<MediFlowApplicationModule>();
        context.Services.AddTransient<UserInitializationService>();
    }

    public override void OnApplicationInitialization(ApplicationInitializationContext context)
    {
        var userInitializationService = context.ServiceProvider.GetRequiredService<UserInitializationService>();
        userInitializationService.InitializeDefaultUsersAsync().GetAwaiter().GetResult();
    }
}
