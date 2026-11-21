using System.ComponentModel.DataAnnotations;

namespace MediFlow.Warehouses;

public class CreateUpdateWarehouseDto
{
    [Required]
    [StringLength(128)]
    public string Name { get; set; }
    
    public string LocationAddress { get; set; }
    
    public string ManagerName { get; set; }
    
    public bool HasColdStorage { get; set; }
}