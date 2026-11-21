using MediFlow.Samples;
using Xunit;

namespace MediFlow.EntityFrameworkCore.Applications;

[Collection(MediFlowTestConsts.CollectionDefinitionName)]
public class EfCoreSampleAppServiceTests : SampleAppServiceTests<MediFlowEntityFrameworkCoreTestModule>
{

}
