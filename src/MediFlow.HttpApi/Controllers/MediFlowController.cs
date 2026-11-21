using MediFlow.Localization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Volo.Abp.AspNetCore.Mvc;

namespace MediFlow.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class MediFlowController : AbpControllerBase
{
    protected MediFlowController()
    {
        LocalizationResource = typeof(MediFlowResource);
    }
}
