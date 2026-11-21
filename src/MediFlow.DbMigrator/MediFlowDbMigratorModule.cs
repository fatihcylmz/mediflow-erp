using MediFlow.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace MediFlow.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(MediFlowEntityFrameworkCoreModule),
    typeof(MediFlowApplicationContractsModule)
    )]
public class MediFlowDbMigratorModule : AbpModule
{
}
