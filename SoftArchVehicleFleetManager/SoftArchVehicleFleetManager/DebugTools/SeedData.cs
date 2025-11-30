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
        var vehicle = new Vehicle
        {
            Name = "Vehicle numero uno",
            LicensePlate = "ASD-1337",
            Model = "string",
            Year = 2003,
            FleetId = db.Fleets.Single().Id,
        };

        db.Vehicles.Add(vehicle);
        db.SaveChanges();
    }

    private static void AddSeedModules(FleetDbContext db)
    {
        var module = new Module
        {
            HardwareId = "XYZ",
            ManufacturerId = db.Manufacturers.Single().Id,
            InterfaceId = db.Interfaces.Single().Id,
            VehicleId = db.Vehicles.Single().Id
        };

        db.Modules.Add(module);
        db.SaveChanges();
    }

    private static void AddSeedFleets(FleetDbContext db)
    {
        var fleet = new Fleet
        {
            Name = "Fleet numero uno"
        };

        db.Fleets.Add(fleet);
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
            Name = "Manufactorer numero uno",
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