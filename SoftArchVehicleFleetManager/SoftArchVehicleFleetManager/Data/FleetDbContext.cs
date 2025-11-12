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

        protected override void OnModelCreating(ModelBuilder b)
        {
            // Vehicle / Fleet: Many-to-One
            b.Entity<Vehicle>()
             .HasOne(v => v.Fleet)
             .WithMany(f => f.Vehicles)
             .HasForeignKey(v => v.FleetId)
             .IsRequired()
             .OnDelete(DeleteBehavior.Restrict);

            b.Entity<Vehicle>().HasIndex(v => v.FleetId);
            b.Entity<Vehicle>().HasIndex(v => v.LicensePlate).IsUnique();
        }
    }
}
