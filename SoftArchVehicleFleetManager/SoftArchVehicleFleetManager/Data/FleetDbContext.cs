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
    }
}
