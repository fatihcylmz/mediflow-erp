using Volo.Abp.Modularity;

namespace MediFlow;

public abstract class MediFlowApplicationTestBase<TStartupModule> : MediFlowTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
