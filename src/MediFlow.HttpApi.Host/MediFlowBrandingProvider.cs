using Microsoft.Extensions.Localization;
using MediFlow.Localization;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace MediFlow;

[Dependency(ReplaceServices = true)]
public class MediFlowBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<MediFlowResource> _localizer;

    public MediFlowBrandingProvider(IStringLocalizer<MediFlowResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
