using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace MediFlow.Data;

/* This is used if database provider does't define
 * IMediFlowDbSchemaMigrator implementation.
 */
public class NullMediFlowDbSchemaMigrator : IMediFlowDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
