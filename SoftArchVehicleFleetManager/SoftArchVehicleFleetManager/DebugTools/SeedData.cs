using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SoftArchVehicleFleetManager.Data;
using SoftArchVehicleFleetManager.Enums;
using SoftArchVehicleFleetManager.Models;
using System;
using System.Linq;

public static class SeedData
{
    public static void Initialize(FleetDbContext db)
    {
        db.Database.Migrate();

        // Don't seed if some data already exists
        if (db.Users.Any())
            return;

        AddSeedUsers(db);
        AddSeedFleets(db);
        AddSeedManufacturers(db);
        AddSeedInterfaces(db);
        AddSeedVehicles(db);
        AddSeedModules(db);
    }

    private static void AddSeedVehicles(FleetDbContext db)
    {
        var vehicle1 = new Vehicle
        {
            Name = "VehicleA",
            LicensePlate = "VEHA-123",
            Model = "string",
            Year = 2003,
            FleetId = db.Fleets.Where(f => f.Name == "FleetA").SingleOrDefault().Id,
        };

        var vehicle2 = new Vehicle
        {
            Name = "VehicleB",
            LicensePlate = "VEHB-123",
            Model = "string",
            Year = 2003,
            FleetId = db.Fleets.Where(f => f.Name == "FleetB").SingleOrDefault().Id,
        };

        db.Vehicles.Add(vehicle1);
        db.Vehicles.Add(vehicle2);
        db.SaveChanges();
    }

    private static void AddSeedModules(FleetDbContext db)
    {
        var module1A = new Module
        {
            HardwareId = "ABC123",
            ManufacturerId = db.Manufacturers.Single().Id,
            InterfaceId = db.Interfaces.Single().Id,
            VehicleId = db.Vehicles.Where(v => v.Name == "VehicleA").SingleOrDefault().Id
        };

        var module2A = new Module
        {
            HardwareId = "ABC234",
            ManufacturerId = db.Manufacturers.Single().Id,
            InterfaceId = db.Interfaces.Single().Id,
            VehicleId = db.Vehicles.Where(v => v.Name == "VehicleA").SingleOrDefault().Id
        };

        var module3A = new Module
        {
            HardwareId = "ABC345",
            ManufacturerId = db.Manufacturers.Single().Id,
            InterfaceId = db.Interfaces.Single().Id,
            VehicleId = db.Vehicles.Where(v => v.Name == "VehicleA").SingleOrDefault().Id
        };

        var module1B = new Module
        {
            HardwareId = "DEF123",
            ManufacturerId = db.Manufacturers.Single().Id,
            InterfaceId = db.Interfaces.Single().Id,
            VehicleId = db.Vehicles.Where(v => v.Name == "VehicleB").SingleOrDefault().Id
        };

        var module2B = new Module
        {
            HardwareId = "DEF234",
            ManufacturerId = db.Manufacturers.Single().Id,
            InterfaceId = db.Interfaces.Single().Id,
            VehicleId = db.Vehicles.Where(v => v.Name == "VehicleB").SingleOrDefault().Id
        };

        db.Modules.Add(module1A);
        db.Modules.Add(module2A);
        db.Modules.Add(module3A);
        db.Modules.Add(module1B);
        db.Modules.Add(module2B);
        db.SaveChanges();
    }

    private static void AddSeedFleets(FleetDbContext db)
    {
        var fleet1 = new Fleet
        {
            Name = "FleetA"
        };
        var fleet2 = new Fleet
        {
            Name = "FleetB"
        };

        db.Fleets.Add(fleet1);
        db.Fleets.Add(fleet2);
        db.SaveChanges();
    }

    private static void AddSeedInterfaces(FleetDbContext db)
    {
        var _interface = new Interface
        {
            Name = "Interface numero uno",
            InterfaceFields = new List<string>() { "speed", "distance" },
            ManufacturerId = db.Manufacturers.Single().Id,
        };

        db.Interfaces.Add(_interface);
        db.SaveChanges();
    }

    private static void AddSeedManufacturers(FleetDbContext db)
    {
        var manufacturer = new Manufacturer
        {
            Name = "ManufacturerA",
        };

        db.Manufacturers.Add(manufacturer);
        db.SaveChanges();
    }

    private static void AddSeedUsers(FleetDbContext db)
    {
        var user = new User
        {
            Username = "admin",
            Role = UserRole.Admin,
        };

        user.PasswordHash = new PasswordHasher<User>().HashPassword(user, "admin");

        db.Users.Add(user);
        db.SaveChanges();
    }
}