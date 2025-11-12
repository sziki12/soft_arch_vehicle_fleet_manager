namespace SoftArchVehicleFleetManager.Dtos.Interfaces
{
    public record InterfaceDto(
        int Id,
        string Name,
        string InterfaceJSON,
        int ManufacturerId
    );
}
