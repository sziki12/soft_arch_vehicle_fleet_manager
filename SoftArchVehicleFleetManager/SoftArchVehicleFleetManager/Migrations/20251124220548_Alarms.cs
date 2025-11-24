using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SoftArchVehicleFleetManager.Migrations
{
    /// <inheritdoc />
    public partial class Alarms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Alarms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    AlarmJSON = table.Column<string>(type: "TEXT", nullable: false),
                    FleetId = table.Column<int>(type: "INTEGER", nullable: false),
                    InterfaceId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alarms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Alarms_Fleets_FleetId",
                        column: x => x.FleetId,
                        principalTable: "Fleets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Alarms_Interfaces_InterfaceId",
                        column: x => x.InterfaceId,
                        principalTable: "Interfaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Alarms_FleetId",
                table: "Alarms",
                column: "FleetId");

            migrationBuilder.CreateIndex(
                name: "IX_Alarms_InterfaceId",
                table: "Alarms",
                column: "InterfaceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Alarms");
        }
    }
}
