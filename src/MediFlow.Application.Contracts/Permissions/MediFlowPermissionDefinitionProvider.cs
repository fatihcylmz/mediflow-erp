using MediFlow.Localization;
using Volo.Abp.Authorization.Permissions;
using Volo.Abp.Localization;

namespace MediFlow.Permissions;

public class MediFlowPermissionDefinitionProvider : PermissionDefinitionProvider
{
    public override void Define(IPermissionDefinitionContext context)
    {
        var myGroup = context.AddGroup(MediFlowPermissions.GroupName);
        //Define your own permissions here. Example:
        //myGroup.AddPermission(MediFlowPermissions.MyPermission1, L("Permission:MyPermission1"));
    }

    private static LocalizableString L(string name)
    {
        return LocalizableString.Create<MediFlowResource>(name);
    }
}
