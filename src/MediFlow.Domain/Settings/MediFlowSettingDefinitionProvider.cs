using Volo.Abp.Settings;

namespace MediFlow.Settings;

public class MediFlowSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(MediFlowSettings.MySetting1));
    }
}
