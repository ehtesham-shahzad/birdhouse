import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../base.entity";
import { Birdhouse } from "./birdhouse.entity";

@Entity()
export class ResidenceHistory extends BaseEntity {

    @Column({ nullable: false, default: 0, unique: false })
    birds: number;

    @Column({ nullable: false, default: 0, unique: false })
    eggs: number;

    @Column({ nullable: false, unique: false })
    birdHouseId: string;

    @ManyToOne(() => Birdhouse, birdhouses => birdhouses.residenceHistory)
    @JoinColumn({ name: "birdHouseId" })
    birdhouse: Birdhouse;
}
