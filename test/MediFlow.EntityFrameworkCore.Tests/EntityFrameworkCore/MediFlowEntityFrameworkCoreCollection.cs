using Xunit;

namespace MediFlow.EntityFrameworkCore;

[CollectionDefinition(MediFlowTestConsts.CollectionDefinitionName)]
public class MediFlowEntityFrameworkCoreCollection : ICollectionFixture<MediFlowEntityFrameworkCoreFixture>
{

}
