using Volo.Abp.Modularity;

namespace MediFlow;

[DependsOn(
    typeof(MediFlowApplicationModule),
    typeof(MediFlowDomainTestModule)
)]
public class MediFlowApplicationTestModule : AbpModule
{

}
