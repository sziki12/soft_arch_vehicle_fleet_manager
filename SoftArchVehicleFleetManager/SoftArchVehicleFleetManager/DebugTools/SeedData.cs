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

    private static void AddSeedUsers(FleetDbContext db)
    {
        var user = new User
        {
            Username = "admin",
            Role = UserRole.Admin,
            Password = "admin"
        };
        db.Users.Add(user);
        db.SaveChanges();
    }
}