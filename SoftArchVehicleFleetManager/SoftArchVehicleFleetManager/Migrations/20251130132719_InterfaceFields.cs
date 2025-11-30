using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoftArchVehicleFleetManager.Migrations
{
    /// <inheritdoc />
    public partial class InterfaceFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InterfaceJSON",
                table: "Interfaces",
                newName: "InterfaceFields");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "InterfaceFields",
                table: "Interfaces",
                newName: "InterfaceJSON");
        }
    }
}
