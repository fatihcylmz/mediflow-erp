using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Volo.Abp;
using Volo.Abp.Account;
using Volo.Abp.Identity;
using Volo.Abp.Modularity;

namespace MediFlow.HttpApi.Controllers;

[Area("admin")]
[Route("admin/[controller]/[action]")]
[Authorize]
public class AdminController : MediFlowController
{
    private readonly IdentityUserManager _userManager;
    private readonly IdentityRoleManager _roleManager;

    public AdminController(
        IdentityUserManager userManager,
        IdentityRoleManager roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<IActionResult> Index()
    {
        var users = await _userManager.GetUsersInRoleAsync("Admin");
        return View(users);
    }

    [HttpGet]
    public async Task<IActionResult> CreateUser()
    {
        var roles = await _roleManager.GetListAsync();
        return View(roles);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(string username, string email, string fullName, string password, string[] roles,
        string phoneNumber, string address, string pharmacyName, string pharmacyGLN, string warehouseName, string warehouseLocation, string supplierName, string supplierTaxNumber)
    {
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            ModelState.AddModelError("", "Kullanıcı adı ve şifre zorunludur.");
            return View();
        }

        var user = new IdentityUser(_userManager.UserManager.Guid.New(), username, email, null)
        {
            Name = fullName?.Split(' ')[0],
            Surname = fullName?.Split(' ').Length > 1 ? fullName.Split(' ')[1] : string.Empty,
            PhoneNumber = phoneNumber
        };

        // Rol'e göre özel bilgileri ekle
        if (roles.Contains("Eczacı"))
        {
            user.SetProperty("PharmacyName", pharmacyName);
            user.SetProperty("PharmacyGLN", pharmacyGLN);
        }
        else if (roles.Contains("Depocu"))
        {
            user.SetProperty("WarehouseName", warehouseName);
            user.SetProperty("WarehouseLocation", warehouseLocation);
        }
        else if (roles.Contains("Tedarikçi"))
        {
            user.SetProperty("SupplierName", supplierName);
            user.SetProperty("SupplierTaxNumber", supplierTaxNumber);
        }

        user.SetProperty("Address", address);
        user.SetEmailConfirmed(true);

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
                ModelState.AddModelError("", error.Description);
            return View();
        }

        if (roles != null && roles.Length > 0)
        {
            foreach (var role in roles)
            {
                await _userManager.AddToRoleAsync(user, role);
            }
        }

        return/Index();
    }
}