namespace SoftArchVehicleFleetManager.Dtos.Modules
{
    public record ModuleCreateDto(
        string HardwareId,
        int ManufacturerId,
        int InterfaceId,
        int VehicleId
    );
}
