using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using MediFlow.EntityFrameworkCore;
using Serilog;
using Serilog.Events;

namespace MediFlow.DbMigrator;

class Program
{
    static async Task Main(string[] args)
    {
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Volo.Abp", LogEventLevel.Warning)
#if DEBUG
                .MinimumLevel.Override("MediFlow", LogEventLevel.Debug)
#else
                .MinimumLevel.Override("MediFlow", LogEventLevel.Information)
#endif
                .Enrich.FromLogContext()
            .WriteTo.Async(c => c.File("Logs/logs.txt"))
            .WriteTo.Async(c => c.Console())
            .CreateLogger();

        await CreateHostBuilder(args).RunConsoleAsync();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .AddAppSettingsSecretsJson()
            .ConfigureLogging((context, logging) => logging.ClearProviders())
            .ConfigureAppConfiguration((hostContext, config) =>
            {
                var basePath = Directory.GetCurrentDirectory();
                config.SetBasePath(basePath);
                config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
                config.AddJsonFile("appsettings.secrets.json", optional: true, reloadOnChange: true);
            })
            .ConfigureServices((hostContext, services) =>
            {
                services.AddHostedService<DbMigratorHostedService>();

                // Configure DbContext directly with Npgsql (like the DesignTime factory does)
                var configuration = hostContext.Configuration;
                var connectionString = configuration.GetConnectionString("Default");

                Console.WriteLine($"Connection string from config: '{connectionString}'");

                services.AddDbContext<MediFlowDbContext>(options =>
                {
                    options.UseNpgsql(connectionString);
                });
            });
}
