using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Extensions.DependencyInjection;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using MediFlow.EntityFrameworkCore;
using MediFlow.MultiTenancy;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.LeptonXLite.Bundling;
using Microsoft.OpenApi;
using OpenIddict.Validation.AspNetCore;
using Volo.Abp;
using Volo.Abp.Account;
using Volo.Abp.Account.Web;
using Volo.Abp.AspNetCore.MultiTenancy;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc.UI.Bundling;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.Shared;
using Volo.Abp.AspNetCore.Serilog;
using Volo.Abp.Autofac;
using Volo.Abp.Localization;
using Volo.Abp.Modularity;
using Volo.Abp.Security.Claims;
using Volo.Abp.PermissionManagement;
using Volo.Abp.Authorization.Permissions;
using System.Security.Claims;
using Volo.Abp.Swashbuckle;
using Volo.Abp.UI.Navigation.Urls;
using Volo.Abp.VirtualFileSystem;

namespace MediFlow;

[DependsOn(
    typeof(MediFlowHttpApiModule),
    typeof(AbpAutofacModule),
    typeof(AbpAspNetCoreMultiTenancyModule),
    typeof(MediFlowApplicationModule),
    typeof(MediFlowEntityFrameworkCoreModule),
    typeof(AbpAspNetCoreMvcUiLeptonXLiteThemeModule),
    typeof(AbpAccountWebOpenIddictModule),
    typeof(AbpAspNetCoreSerilogModule),
    typeof(AbpSwashbuckleModule)
)]
public class MediFlowHttpApiHostModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        PreConfigure<OpenIddictBuilder>(builder =>
        {
            // DISABLE OpenIddict validation - we use custom JWT Bearer with symmetric key
            // builder.AddValidation(options =>
            // {
            //     options.AddAudiences("MediFlow");
            //     options.UseLocalServer();
            //     options.UseAspNetCore();
            // });

            builder.AddServer(options =>
            {
                // Token endpoint'ini etkinleştir
                options.SetTokenEndpointUris("/connect/token");

                // Password flow etkinleştir
                options.AllowPasswordFlow()
                       .AllowRefreshTokenFlow();

                // Token'ları imzalamak için geliştirme sertifikası kullan
                options.AddDevelopmentEncryptionCertificate()
                       .AddDevelopmentSigningCertificate();

                // ASP.NET Core entegrasyonu
                options.UseAspNetCore()
                       .EnableTokenEndpointPassthrough();
            });
        });
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();
        var hostingEnvironment = context.Services.GetHostingEnvironment();

        ConfigureAuthentication(context);
        ConfigureBundles();
        ConfigureUrls(configuration);
        ConfigureConventionalControllers();
        ConfigureAntiforgery();
        ConfigureVirtualFileSystem(context);
        ConfigureCors(context, configuration);
        ConfigureSwaggerServices(context);
        ConfigureRateLimiting(context);
    }

    private void ConfigureRateLimiting(ServiceConfigurationContext context)
    {
        context.Services.AddRateLimiter(options =>
        {
            options.AddFixedWindowLimiter("default", o =>
            {
                o.PermitLimit = 200;
                o.Window = TimeSpan.FromMinutes(1);
            });
            options.RejectionStatusCode = 429;
        });
    }

    private void ConfigureAuthentication(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();
        var keyString = configuration["StringEncryption:DefaultPassPhrase"] ?? "MediFlow_Default_Secret_Key_32Chars!";
        var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(keyString));

        context.Services.AddAuthentication(options =>
        {
            options.DefaultScheme = "Bearer";
            options.DefaultAuthenticateScheme = "Bearer";
            options.DefaultChallengeScheme = "Bearer";
        })
        .AddJwtBearer("Bearer", options =>
        {
            options.Authority = null;
            options.Audience = "MediFlow";
            options.RequireHttpsMetadata = false; // Allow HTTP for development
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = "MediFlow",
                ValidateAudience = true,
                ValidAudience = "MediFlow",
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(5),
                RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
                NameClaimType = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
            };
        });

        context.Services.Configure<AbpClaimsPrincipalFactoryOptions>(options =>
        {
            // IsDynamicClaimsEnabled = true: ABP'nin kendi claim injection'ı
            // AbpRoleClaims tablosundan permission claimlerini principal'e ekler.
            options.IsDynamicClaimsEnabled = true;
        });

        // JWT'deki permission claimlerini (permission claim type) doğrudan okuyan
        // claim-based IPermissionValueProvider ekle. Bu sayede ABP'nin veritabanındaki
        // AbpPermissionGrants tablosuna ba˘glı kalmadan, JWT'teki permission claimleri
        // [Authorize(Permission)] yetkilendirmesini sağlar.
        // ABP'nin varsayılan RolePermissionValueProvider'ı (AbpPermissionGrants'a bağımlı)
        // dışarıda bırakıp sadece JWT tabanlı provider'ı tek kaynak yapıyoruz.
        var existingProviders = context.Services
            .Where(s => s.ServiceType == typeof(IPermissionValueProvider))
            .ToList();
        foreach (var d in existingProviders)
        {
            context.Services.Remove(d);
        }
        context.Services.AddTransient<JwtPermissionValueProvider>();
        context.Services.AddTransient<IPermissionValueProvider, JwtPermissionValueProvider>();

        // AbpPermissionOptions.ValueProviders listesine de ekle (ABP'nin permission pipeline'ı)
        context.Services.Configure<AbpPermissionOptions>(options =>
        {
            if (!options.ValueProviders.Contains(typeof(JwtPermissionValueProvider)))
            {
                options.ValueProviders.Insert(0, typeof(JwtPermissionValueProvider));
            }
        });

        // Authorization policyleri - permission controller'ları tarafından kullanılıyor
        context.Services.AddAuthorization(options =>
        {
            options.AddPolicy("MediFlow.Inventory", builder =>
            {
                builder.RequireAuthenticatedUser();
            });
            options.AddPolicy("MediFlow.Pricing", builder =>
            {
                builder.RequireAuthenticatedUser();
            });
        });
    }

    private void ConfigureBundles()
    {
        Configure<AbpBundlingOptions>(options =>
        {
            options.StyleBundles.Configure(
                LeptonXLiteThemeBundles.Styles.Global,
                bundle =>
                {
                    bundle.AddFiles("/global-styles.css");
                }
            );
        });
    }

    private void ConfigureUrls(IConfiguration configuration)
    {
        Configure<AppUrlOptions>(options =>
        {
            options.Applications["MVC"].RootUrl = configuration["App:SelfUrl"];
            options.RedirectAllowedUrls.AddRange(configuration["App:RedirectAllowedUrls"]?.Split(',') ?? Array.Empty<string>());

            options.Applications["Angular"].RootUrl = configuration["App:ClientUrl"];
            options.Applications["Angular"].Urls[AccountUrlNames.PasswordReset] = "account/reset-password";
        });
    }

    private void ConfigureVirtualFileSystem(ServiceConfigurationContext context)
    {
        var hostingEnvironment = context.Services.GetHostingEnvironment();

        if (hostingEnvironment.IsDevelopment())
        {
            Configure<AbpVirtualFileSystemOptions>(options =>
            {
                options.FileSets.ReplaceEmbeddedByPhysical<MediFlowDomainSharedModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}MediFlow.Domain.Shared"));
                options.FileSets.ReplaceEmbeddedByPhysical<MediFlowDomainModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}MediFlow.Domain"));
                options.FileSets.ReplaceEmbeddedByPhysical<MediFlowApplicationContractsModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}MediFlow.Application.Contracts"));
                options.FileSets.ReplaceEmbeddedByPhysical<MediFlowApplicationModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}MediFlow.Application"));
            });
        }
    }

    private void ConfigureConventionalControllers()
    {
        // Konvensiyonel otomatik controller oluşturma devre dışı bırakıldı.
        // AppService'ler otomatik olarak controller'a dönüştürülüp route çakışmasına neden oluyordu.
        // Tüm HTTP erişimi Controller katmanındaki [Route] tanımları üzerinden yürür.
    }

    private void ConfigureAntiforgery()
    {
        // Cookie-based SPA: the React app never submits an antiforgery token, so ABP's
        // auto-validation (which fires for every non-GET request in an [Area("admin")]
        // controller) rejects every POST. Disable auto-validation for the API.
        Configure<Volo.Abp.AspNetCore.Mvc.AntiForgery.AbpAntiForgeryOptions>(options =>
        {
            options.AutoValidate = false;
        });
    }

    private static void ConfigureSwaggerServices(ServiceConfigurationContext context)
    {
        context.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "MediFlow API", Version = "v1" });
            options.DescribeAllParametersInCamelCase();
            options.CustomSchemaIds(type => type.FullName);
        });
    }

    private void ConfigureCors(ServiceConfigurationContext context, IConfiguration configuration)
    {
        context.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder
                    .WithOrigins(configuration["App:CorsOrigins"]?
                        .Split(",", StringSplitOptions.RemoveEmptyEntries)
                        .Select(o => o.RemovePostFix("/"))
                        .ToArray() ?? Array.Empty<string>())
                    .WithAbpExposedHeaders()
                    .SetIsOriginAllowedToAllowWildcardSubdomains()
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
    }

    public override void OnApplicationInitialization(ApplicationInitializationContext context)
    {
        var app = context.GetApplicationBuilder();
        var env = context.GetEnvironment();

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseAbpRequestLocalization();

        if (!env.IsDevelopment())
        {
            app.UseErrorPage();
        }

        app.UseCorrelationId();
        app.MapAbpStaticAssets();
        app.UseRouting();
        app.UseCors();
        app.UseRateLimiter();
        app.UseAuthentication();
        // app.UseAbpOpenIddictValidation(); // DISABLED: Conflicts with custom JWT Bearer validation

        if (MultiTenancyConsts.IsEnabled)
        {
            app.UseMultiTenancy();
        }
        app.UseUnitOfWork();
        app.UseDynamicClaims();
        app.UseAuthorization();

        // Admin-only panel
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllerRoute(
                name: "admin",
                pattern: "admin/{controller=Dashboard}/{action=Index}"
            );
        });

        app.UseSwagger();
        app.UseAbpSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "MediFlow API");

            var configuration = context.ServiceProvider.GetRequiredService<IConfiguration>();
            c.OAuthClientId(configuration["AuthServer:SwaggerClientId"]);
            c.OAuthScopes("MediFlow");
        });

        app.UseAuditing();
        app.UseAbpSerilogEnrichers();
        app.UseConfiguredEndpoints();
    }

    public class JwtPermissionValueProvider : IPermissionValueProvider
    {
        public string Name => "J";

        public Task<PermissionGrantResult> CheckAsync(PermissionValueCheckContext context)
        {
            var permission = context.Permission;
            if (permission == null)
            {
                return Task.FromResult(default(PermissionGrantResult));
            }

            var principal = context.Principal;
            if (principal == null)
            {
                return Task.FromResult(default(PermissionGrantResult));
            }

            // JWT'deki permission claim'i hem tekil string hem de JSON dizisi ["perm1","perm2",...] formatında
            // gelebiliyor. Her iki durumu da ele al.
            // Ayrıca claim type hem "permission" hem de ABP'nin tam URI formatı olabilir.
            var hasClaim = principal.HasClaim(c =>
                (c.Type == "permission" || c.Type == "http://www.aspnetboilerplate.com/claims/permission") &&
                CheckPermissionInClaim(c.Value, permission.Name));

            // Log to console for debugging
            Console.WriteLine($"JwtPermissionValueProvider.CheckAsync: Permission={permission.Name}, HasClaim={hasClaim}");

            return Task.FromResult(hasClaim ? PermissionGrantResult.Granted : default(PermissionGrantResult));
        }

        // Claim değerinde JSON dizisi ["a","b"] varsa içeri "permission.Name" değerini arayıp bul,
        // tek string ise doğrudan karşılaştırma yap.
        private static bool CheckPermissionInClaim(string claimValue, string permissionName)
        {
            if (claimValue.StartsWith('['))
            {
                // JSON dizisi formatı: ["perm1","perm2",...] - ayrıştırıp içinde istenen izni ara
                try
                {
                    var perms = System.Text.Json.JsonSerializer.Deserialize<string[]>(claimValue);
                    return perms?.Contains(permissionName) == true;
                }
                catch
                {
                    // Deserialize başarısızsa tek string olarak düşünüp karşılaştırma
                    return claimValue == permissionName;
                }
            }
            // Tek string formatı
            return claimValue == permissionName;
        }

        public Task<MultiplePermissionGrantResult> CheckAsync(PermissionValuesCheckContext context)
        {
            var principal = context.Principal;
            if (principal == null)
            {
                return Task.FromResult(new MultiplePermissionGrantResult(context.Permissions.Select(p => p.Name).ToArray(), default(PermissionGrantResult)));
            }

            var results = new Dictionary<string, bool>();
            foreach (var p in context.Permissions)
            {
                results[p.Name] = principal.HasClaim(c =>
                    c.Type == "permission" &&
                    CheckPermissionInClaim(c.Value, p.Name));
            }

            var allGranted = results.Values.All(v => v);

            // Log to console for debugging
            Console.WriteLine($"JwtPermissionValueProvider.CheckAsync(Multiple): Permissions={string.Join(", ", context.Permissions.Select(p => p.Name))}, AllGranted={allGranted}");

            return Task.FromResult(new MultiplePermissionGrantResult(
                context.Permissions.Select(p => p.Name).ToArray(),
                allGranted ? PermissionGrantResult.Granted : default(PermissionGrantResult)));
        }
    }
}
