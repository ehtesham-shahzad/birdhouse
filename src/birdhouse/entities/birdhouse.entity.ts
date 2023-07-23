import { BaseEntity } from "src/base.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class Birdhouse extends BaseEntity {

    @Column({ nullable: false })
    ubid: string;

    @Column({ nullable: false })
    longitude: number;

    @Column({ nullable: false })
    latitude: number;

    @Column({ nullable: false })
    name: string;

    @Column({ default: 0 })
    birds: number;

    @Column({ default: 0 })
    eggs: number;

}
