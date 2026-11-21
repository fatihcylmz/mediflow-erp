using Volo.Abp.Modularity;

namespace MediFlow;

/* Inherit from this class for your domain layer tests. */
public abstract class MediFlowDomainTestBase<TStartupModule> : MediFlowTestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
