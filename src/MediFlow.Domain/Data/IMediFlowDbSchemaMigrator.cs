using System.Threading.Tasks;

namespace MediFlow.Data;

public interface IMediFlowDbSchemaMigrator
{
    Task MigrateAsync();
}
