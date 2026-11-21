using System;
using System.Collections.Generic;
using System.Text;
using MediFlow.Localization;
using Volo.Abp.Application.Services;

namespace MediFlow;

/* Inherit your application services from this class.
 */
public abstract class MediFlowAppService : ApplicationService
{
    protected MediFlowAppService()
    {
        LocalizationResource = typeof(MediFlowResource);
    }
}
