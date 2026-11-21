using Volo.Abp.Modularity;

namespace MediFlow;

[DependsOn(
    typeof(MediFlowDomainModule),
    typeof(MediFlowTestBaseModule)
)]
public class MediFlowDomainTestModule : AbpModule
{

}
