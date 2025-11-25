namespace SoftArchVehicleFleetManager.Dtos.Modules
{
    public record ModuleUpdateDto(
        string? HardwareId,
        int? ManufacturerId,
        int? InterfaceId,
        int? VehicleId
    );
}
