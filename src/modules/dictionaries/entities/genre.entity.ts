import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  external_id: number; // ID из внешней системы (AniLibria API)

  @Column()
  name: string;

  @Column('jsonb')
  image: {
    optimized_preview: string;
    preview: string;
  };
}
