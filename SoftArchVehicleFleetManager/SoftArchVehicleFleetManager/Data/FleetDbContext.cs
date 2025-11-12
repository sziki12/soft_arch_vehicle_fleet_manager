using Microsoft.EntityFrameworkCore;
using SoftArchVehicleFleetManager.Models;

namespace SoftArchVehicleFleetManager.Data
{
    public class FleetDbContext : DbContext
    {
        public FleetDbContext(DbContextOptions<FleetDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Manufacturer> Manufacturers => Set<Manufacturer>();
        public DbSet<Fleet> Fleets => Set<Fleet>();
        public DbSet<Vehicle> Vehicles => Set<Vehicle>();
        public DbSet<Interface> Interfaces => Set<Interface>();

        protected override void OnModelCreating(ModelBuilder b)
        {
            // User: Username unique
            b.Entity<User>().HasIndex(u => u.Username).IsUnique();

            // Vehicle / Fleet: Many-to-One
            b.Entity<Vehicle>()
             .HasOne(v => v.Fleet)
             .WithMany(f => f.Vehicles)
             .HasForeignKey(v => v.FleetId)
             .IsRequired()
             .OnDelete(DeleteBehavior.Restrict);

            b.Entity<Vehicle>().HasIndex(v => v.FleetId);
            b.Entity<Vehicle>().HasIndex(v => v.LicensePlate).IsUnique();


            // Interface / Manufacturer: Many-to-One
            b.Entity<Interface>()
             .HasOne(i => i.Manufacturer)
             .WithMany(m => m.Interfaces)
             .HasForeignKey(i => i.ManufacturerId)
             .IsRequired()
             .OnDelete(DeleteBehavior.Restrict);

            b.Entity<Interface>().HasIndex(i => i.ManufacturerId);
        }
    }
}
