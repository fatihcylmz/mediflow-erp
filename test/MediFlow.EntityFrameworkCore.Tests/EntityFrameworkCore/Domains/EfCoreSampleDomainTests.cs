using MediFlow.Samples;
using Xunit;

namespace MediFlow.EntityFrameworkCore.Domains;

[Collection(MediFlowTestConsts.CollectionDefinitionName)]
public class EfCoreSampleDomainTests : SampleDomainTests<MediFlowEntityFrameworkCoreTestModule>
{

}
