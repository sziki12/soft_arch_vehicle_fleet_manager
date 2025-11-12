namespace SoftArchVehicleFleetManager.Dtos.Interfaces
{
    public record InterfaceCreateDto(
        string Name,
        string InterfaceJSON,
        int ManufacturerId
    );
}
