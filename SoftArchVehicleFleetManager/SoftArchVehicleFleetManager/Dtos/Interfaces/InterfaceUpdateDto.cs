namespace SoftArchVehicleFleetManager.Dtos.Interfaces
{
    public record InterfaceUpdateDto(
        string? Name,
        string? InterfaceJSON,
        int? ManufacturerId
    );
}
