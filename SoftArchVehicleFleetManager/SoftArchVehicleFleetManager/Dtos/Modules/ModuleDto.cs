namespace SoftArchVehicleFleetManager.Dtos.Modules
{
    public record ModuleDto(
        int Id,
        string HardwareId,
        int ManufacturerId,
        int InterfaceId,
        int VehicleId
    );
}
